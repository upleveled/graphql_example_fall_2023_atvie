import { cache } from 'react';
import { Animal } from '../migrations/00000-createTableAnimals';
import { sql } from './connect';

export const getAnimals = cache(async () => {
  const animals = await sql<Animal[]>`
    SELECT
      *
    FROM
      animals
  `;
  return animals;
});

export const getAnimalById = cache(async (id: number) => {
  const [animal] = await sql<Animal[]>`
    SELECT
      *
    FROM
      animals
    WHERE
      id = ${id}
  `;
  return animal;
});

export const createAnimal = cache(
  async (firstName: string, type: string, accessory: string) => {
    const [animal] = await sql<Animal[]>`
      INSERT INTO
        animals (first_name, type, accessory)
      VALUES
        (
          ${firstName},
          ${type},
          ${accessory}
        )
      RETURNING
        *
    `;

    return animal;
  },
);

export const updateAnimalBySessionToken = cache(
  async (
    id: number,
    firstName: string,
    type: string,
    accessory: string,
    insecureSessionToken: string,
  ) => {
    // FIXME: Remove this early return when proper token validation is implemented (see FIXME in query below)
    if (
      insecureSessionToken !==
      'ae96c51f--fixme--insecure-hardcoded-session-token--5a3e491b4f'
    ) {
      return undefined;
    }

    const [animal] = await sql<Animal[]>`
      UPDATE animals
      SET
        first_name = ${firstName},
        type = ${type},
        accessory = ${accessory}
        -- FIXME: Implement proper token validation with INNER JOIN on sessions table
      WHERE
        id = ${id}
      RETURNING
        *
    `;

    return animal;
  },
);

export const deleteAnimalBySessionToken = cache(
  async (animalId: number, insecureSessionToken: string) => {
    // FIXME: Remove this early return when proper token validation is implemented (see FIXME in query below)
    if (
      insecureSessionToken !==
      'ae96c51f--fixme--insecure-hardcoded-session-token--5a3e491b4f'
    ) {
      return undefined;
    }

    const [animal] = await sql<Animal[]>`
      DELETE FROM animals
      -- FIXME: Implement proper token validation with INNER JOIN on sessions table
      WHERE
        id = ${animalId}
      RETURNING
        *
    `;
    return animal;
  },
);
