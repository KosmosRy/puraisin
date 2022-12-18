import { withSession } from '../../utils/session';
import { submitBite } from '../../utils/lib';
import { BiteInfo } from '../../types/common';

export default withSession(async (req, res, session) => {
  const currentBinge = await submitBite(session, req.body as BiteInfo);
  return res.status(200).json(currentBinge);
});
