import { type FC } from 'react';
import { SigninButton } from '../../../components/SigninButton';
import { container, disclaimer, heading1, heading2 } from '../../../components/Signin.css';

const SigninPage: FC = () => (
  <div className={container}>
    <h1 className={heading1}>Tervetuloa!</h1>
    <h2 className={heading2}>Ja eikun puraisemaan!</h2>
    <div className={disclaimer}>
      kunhan annat ensiksi Slackille oikeudet pankkitiliisi ja perikuntaasi
    </div>
    <SigninButton />
  </div>
);

export default SigninPage;
