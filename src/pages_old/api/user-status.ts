import { getUserStatus } from '../../utils/lib';
import { withSession } from '../../utils/session';

export default withSession(async (req, res, session) => {
  const userStatus = await getUserStatus(session.id);
  res.status(200).json(userStatus);
});
