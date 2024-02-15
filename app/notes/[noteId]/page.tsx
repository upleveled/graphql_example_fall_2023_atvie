import { cookies } from 'next/headers';
import Link from 'next/link';
import { getNote } from '../../../database/notes';

type Props = {
  params: {
    noteId: string;
  };
};

export default async function NotePage(props: Props) {
  // Task: Restrict access to the note page only to the user who created the note

  // 1. Checking if the sessionToken cookie exists
  const sessionTokenCookie = cookies().get('sessionToken');

  // 2. Query the note with the session token and noteId
  const note =
    sessionTokenCookie &&
    (await getNote(sessionTokenCookie.value, Number(props.params.noteId)));

  // 3. If there is no note for the current user, show restricted access message
  if (!note) {
    return (
      <div>
        <h1>Restricted access</h1>
        <Link href="/notes">Back to notes</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>{note.title}</h1>
      <p>{note.textContent}</p>
      <Link href="/notes">Back to notes</Link>
    </div>
  );
}
