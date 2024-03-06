import { logout } from './Heading.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { type FC } from 'react';

export const SignOutButton: FC = () => {
  const router = useRouter();

  const onSignOut = async () => {
    await signOut({ redirect: false, callbackUrl: '/' });
    router.refresh();
  };

  return (
    <Link className={logout} href="/" onClick={onSignOut}>
      Kirjaudu ulos
    </Link>
  );
};
