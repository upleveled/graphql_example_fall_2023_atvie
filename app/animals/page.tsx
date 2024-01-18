import { gql } from '@apollo/client';
import Image from 'next/image';
import Link from 'next/link';
import { Animal } from '../../migrations/00000-createTableAnimals';
import { getClient } from '../../util/apolloClient';

export default async function AnimalsPage() {
  const { data } = await getClient().query<{
    animals: Pick<Animal, 'id' | 'firstName' | 'type'>[];
  }>({
    query: gql`
      query GetAnimals {
        animals {
          id
          firstName
        }
      }
    `,
  });

  return (
    <div>
      <h1>These are my animals</h1>

      {data.animals.map((animal) => {
        return (
          <div
            key={`animal-div-${animal.id}`}
            data-test-id={`animal-type-${animal.type}`}
          >
            <Link href={`/animals/${animal.id}`}>
              <div>{animal.firstName}</div>
              <Image
                src={`/images/${animal.firstName}.png`}
                alt={animal.firstName}
                width={200}
                height={200}
              />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
