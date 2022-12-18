import { Session, unstable_getServerSession } from 'next-auth';
import { SlackSession } from '../types/slack';
import { NextApiHandler } from 'next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { NextApiRequest, NextApiResponse } from 'next/dist/shared/lib/utils';

export const isSlackSession = (session?: Session | null): session is SlackSession => {
  if (session) {
    const { id, botToken } = session as SlackSession;
    return !!id && !!botToken;
  }
  return false;
};

type WithSessionApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>,
  session: SlackSession,
) => unknown | Promise<unknown>;

export const withSession =
  (handler: WithSessionApiHandler): NextApiHandler =>
  async (req, res) => {
    const session = await unstable_getServerSession(req, res, authOptions);

    if (isSlackSession(session)) {
      try {
        return handler(req, res, session);
      } catch (err) {
        console.error(err);
        res.status(500).end();
        return;
      }
    }

    return res.status(401).json({ message: 'Meeppä pois siitä' });
  };
