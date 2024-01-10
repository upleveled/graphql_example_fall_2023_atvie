import { gql } from '@apollo/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getClient } from '../../../util/apolloClient';
import AnimalsForm from './AnimalsForm';

export default async function Dashboard() {
  const fakeSessionToken = cookies().get('fakeSession');

  const { data } = await getClient().query({
    query: gql`
      query LoggedInAnimal($firstName: String!) {
        loggedInAnimalByFirstName(firstName: $firstName) {
          firstName
        }
      }
    `,
    variables: {
      firstName: fakeSessionToken?.value || '',
    },
  });

  if (!data.loggedInAnimalByFirstName) {
    redirect('/login');
  }

  return <AnimalsForm />;
}
