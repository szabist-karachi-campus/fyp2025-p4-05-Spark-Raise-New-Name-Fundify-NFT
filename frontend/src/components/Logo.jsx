import { logo } from '../assets';

const Logo = ({ w, h }) => {
  return <img src={logo} alt="Logo" width={w || 128} height={h || 128} />;
};

export default Logo;