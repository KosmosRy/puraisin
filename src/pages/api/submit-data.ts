import { withSession } from '../../utils/session';
import { submitBite } from '../../utils/lib';
import { type BiteInfo } from '../../types/common';
import { addBiter } from '../../utils/db';

export default withSession(async (req, res, session) => {
  await addBiter(session.id, session.user.name);
  const currentBinge = await submitBite(session, req.body as BiteInfo);
  res.status(200).json(currentBinge);
});
