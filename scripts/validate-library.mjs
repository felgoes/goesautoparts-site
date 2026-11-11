import { mkdir, readFile, readdir, rm, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(projectRoot, 'src/content/library');
const outputDir = path.join(projectRoot, 'src/library/generated');
const publicDir = path.join(projectRoot, 'public');

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const errorsForReview = (review, label, sources) => {
  const errors = [];
  if (
    !isObject(review) ||
    !['pending', 'approved'].includes(review.status) ||
    !Array.isArray(review.sourceIds)
  ) {
    return [label + ': revisão inválida'];
  }
  if (review.status === 'approved') {
    if (
      !review.reviewer ||
      !review.reviewedAt ||
      Number.isNaN(Date.parse(review.reviewedAt)) ||
      !/T.*(?:Z|[+-]\\d{2}:\\d{2})$/.test(review.reviewedAt)
    )
      errors.push(label + ': aprovação exige revisor e data ISO com fuso');
    if (!review.sourceIds.length) errors.push(label + ': aprovação exige fontes');
    for (const sourceId of review.sourceIds) {
      const source = sources.find((item) => item.id === sourceId);
      if (!source || source.status !== 'approved' || (!source.url && !source.evidenceId))
        errors.push(label + ': fonte aprovada ausente ou inválida (' + sourceId + ')');
    }
  }
  return errors;
};
const photoFileErrors = async (photo, label, publicDir) => {
  const errors = [];
  if (!isObject(photo) || !Array.isArray(photo.variants)) return [label + ': fotografia inválida'];
  if (photo.review.status === 'approved') {
    if (
      !photo.variants.length ||
      !photo.alt ||
      !photo.author ||
      !photo.originUrl ||
      !photo.license ||
      !photo.licenseUrl ||
      !photo.credit ||
      !photo.rightsEvidenceId
    ) {
      errors.push(label + ': foto aprovada exige arquivo, descrição, origem e crédito/licença');
    }
    for (const variant of photo.variants) {
      if (
        !variant.src?.startsWith('/library/') ||
        !Number.isInteger(variant.width) ||
        !Number.isInteger(variant.height) ||
        variant.width < 1 ||
        variant.height < 1
      ) {
        errors.push(label + ': variante inválida');
        continue;
      }
      try {
        await access(path.join(publicDir, variant.src.slice(1)));
      } catch {
        errors.push(label + ': arquivo não encontrado (' + variant.src + ')');
      }
    }
  }
  return errors;
};

export async function validateEntry(entry, { publicDir = path.join(projectRoot, 'public') } = {}) {
  const errors = [];
  if (
    !isObject(entry) ||
    entry.schemaVersion !== 1 ||
    !['draft', 'published'].includes(entry.publicationStatus)
  )
    return ['registro ou schemaVersion inválido'];
  const { vehicle, sources, cover, parts } = entry;
  if (
    !isObject(vehicle) ||
    vehicle.market !== 'BR' ||
    typeof vehicle.id !== 'string' ||
    typeof vehicle.modelYear !== 'number'
  )
    errors.push('veículo inválido');
  if (!Array.isArray(sources) || !Array.isArray(parts)) return ['sources e parts devem ser listas'];
  if (!/^\/consulta-por-carro\/[a-z0-9-]+\/[a-z0-9-]+$/.test(entry.route))
    errors.push('rota inválida');
  for (const source of sources) {
    if (
      !source.id ||
      !['vehicle', 'fitment', 'photo'].includes(source.scope) ||
      !['pending', 'approved'].includes(source.status)
    )
      errors.push('fonte inválida');
    if (source.url && !source.url.startsWith('https://'))
      errors.push('fonte pública deve usar HTTPS: ' + source.id);
    if (source.status === 'approved' && !source.url && !source.evidenceId)
      errors.push('fonte aprovada sem origem verificável: ' + source.id);
    if (
      source.status === 'approved' &&
      source.consultedAt &&
      (!Number.isFinite(Date.parse(source.consultedAt)) ||
        !/T.*(?:Z|[+-]\\d{2}:\\d{2})$/.test(source.consultedAt))
    )
      errors.push('data de consulta deve incluir fuso: ' + source.id);
  }
  errors.push(...errorsForReview(vehicle?.review, 'veículo', sources));
  errors.push(...errorsForReview(cover?.review, 'capa', sources));
  errors.push(...(await photoFileErrors(cover, 'capa', publicDir)));
  if (entry.publicationStatus === 'published') {
    if (vehicle?.review?.status !== 'approved')
      errors.push('publicação exige configuração aprovada');
    if (cover?.role !== 'cover' || cover?.review?.status !== 'approved')
      errors.push('publicação exige capa aprovada');
    if (!parts.length) errors.push('publicação exige ao menos uma aplicação aprovada');
  }
  const partIds = new Set();
  for (const part of parts) {
    if (!part.id || partIds.has(part.id)) errors.push('ID de peça ausente ou duplicado');
    partIds.add(part.id);
    if (typeof part.reference?.code !== 'string' || !part.reference.code.trim())
      errors.push('código de referência deve ser texto');
    errors.push(...errorsForReview(part.reference?.review, 'referência ' + part.id, sources));
    errors.push(...errorsForReview(part.fitment?.review, 'aplicação ' + part.id, sources));
    if (part.fitment?.vehicleId !== vehicle?.id)
      errors.push('aplicação aponta para configuração diferente: ' + part.id);
    for (const photo of part.photos ?? []) {
      errors.push(...errorsForReview(photo?.review, 'foto ' + part.id + '/' + photo.id, sources));
      errors.push(...(await photoFileErrors(photo, 'foto ' + part.id + '/' + photo.id, publicDir)));
    }
    if (entry.publicationStatus === 'published') {
      if (
        !['oem', 'manufacturer'].includes(part.reference?.kind) ||
        part.reference?.review?.status !== 'approved'
      )
        errors.push('publicação exige referência classificada e aprovada: ' + part.id);
      if (part.fitment?.review?.status !== 'approved')
        errors.push('publicação exige aplicação aprovada: ' + part.id);
      const roles = new Set(
        (part.photos ?? [])
          .filter((photo) => photo.review?.status === 'approved')
          .map((photo) => photo.role),
      );
      if (!roles.has('part') || !roles.has('identification'))
        errors.push('publicação exige fotos aprovadas da peça e identificação: ' + part.id);
      if ((part.photos ?? []).filter((photo) => photo.review?.status === 'approved').length < 2)
        errors.push('publicação exige duas fotos aprovadas: ' + part.id);
    }
  }
  return errors;
}

async function main() {
  const names = (await readdir(sourceDir)).filter((name) => name.endsWith('.json')).sort();
  const entries = [];
  const vehicleIds = new Set();
  const routes = new Set();
  for (const name of names) {
    const entry = JSON.parse(await readFile(path.join(sourceDir, name), 'utf8'));
    const errors = await validateEntry(entry);
    if (errors.length) throw new Error(name + ':\n- ' + errors.join('\n- '));
    if (entry.publicationStatus === 'published') {
      if (vehicleIds.has(entry.vehicle.id) || routes.has(entry.route))
        throw new Error(name + ': ID de veículo ou rota publicada duplicada');
      vehicleIds.add(entry.vehicle.id);
      routes.add(entry.route);
      entries.push(entry);
    }
  }
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(path.join(outputDir, 'entries'), { recursive: true });
  const cards = [];
  const loaders = [];
  for (const entry of entries) {
    const safeId = entry.vehicle.id.replace(/[^a-z0-9-]/g, '-');
    const moduleName = safeId + '.ts';
    const moduleSource =
      "import type { LibraryEntry } from '../library.models';\nexport const entry: LibraryEntry = " +
      JSON.stringify(entry, null, 2) +
      ';\n';
    await writeFile(path.join(outputDir, 'entries', moduleName), moduleSource);
    const thumbnail = entry.cover.variants
      .slice()
      .sort((a, b) => a.width * a.height - b.width * b.height)[0];
    cards.push({
      vehicleId: entry.vehicle.id,
      route: entry.route,
      make: entry.vehicle.make,
      model: entry.vehicle.model,
      trim: entry.vehicle.trim,
      modelYear: entry.vehicle.modelYear,
      thumbnail: { ...thumbnail, alt: entry.cover.alt },
    });
    loaders.push(
      'case ' +
        JSON.stringify(entry.vehicle.id) +
        ": return import('./entries/" +
        safeId +
        "').then((module) => module.entry);",
    );
  }
  const generated =
    "import type { LibraryCard, LibraryEntry } from '../library.models';\n" +
    'export const libraryCards: LibraryCard[] = ' +
    JSON.stringify(cards, null, 2) +
    ';\n' +
    'export async function loadLibraryEntry(id: string): Promise<LibraryEntry | null> { switch (id) { ' +
    loaders.join(' ') +
    ' default: return null; } }\n';
  await writeFile(path.join(outputDir, 'library.generated.ts'), generated);
  console.log(
    'Biblioteca validada: ' +
      entries.length +
      ' ficha(s) publicada(s), ' +
      (names.length - entries.length) +
      ' rascunho(s) excluído(s).',
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
