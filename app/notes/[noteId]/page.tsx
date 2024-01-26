import { cookies } from 'next/headers';
import Link from 'next/link';
import { getNoteBySessionToken } from '../../../database/notes';
import styles from '../notes.module.scss';

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
    (await getNoteBySessionToken(
      sessionTokenCookie.value,
      Number(props.params.noteId),
    ));

  // 3. If there is no note for the current user, show restricted access message
  if (!note) {
    return (
      <div className={styles.restrictedAccessError}>
        <h2>Restricted access</h2>
        <Link href="/notes">Back to notes</Link>
      </div>
    );
  }

  return (
    <div className={styles.noteContainer}>
      <h1>Title: {note.title}</h1>
      <p>Content: {note.textContent}</p>
      <Link href="/notes">Back to notes</Link>
    </div>
  );
}