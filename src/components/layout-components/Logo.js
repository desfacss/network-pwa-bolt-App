import React from 'react';
import { SIDE_NAV_WIDTH, SIDE_NAV_COLLAPSED_WIDTH, NAV_TYPE_TOP } from 'constants/ThemeConstant';
import { APP_NAME } from 'configs/AppConfig';
import { useSelector } from 'react-redux';
import utils from 'utils';
import { Grid } from 'antd';
import styled from '@emotion/styled';
import { TEMPLATE } from 'constants/ThemeConstant';

const LogoWrapper = styled.div(({ isCollapsed }) => ({
  height: TEMPLATE.HEADER_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  padding: `0 1rem`,
  paddingLeft: isCollapsed ? '28px' : '1rem', // Add padding-left when collapsed
  backgroundColor: 'transparent',
  transition: 'all .2s ease',
}));

const { useBreakpoint } = Grid;

export const Logo = ({ mobileLogo, logoType }) => {
  const isMobile = !utils.getBreakPoint(useBreakpoint()).includes('lg');

  const navCollapsed = useSelector((state) => state.theme.navCollapsed);
  const navType = useSelector((state) => state.theme.navType);

  const getLogoWidthGutter = () => {
    const isNavTop = navType === NAV_TYPE_TOP ? true : false;
    if (isMobile && !mobileLogo) {
      return 0;
    }
    if (isNavTop) {
      return 'auto';
    }
    if (navCollapsed) {
      return `${SIDE_NAV_COLLAPSED_WIDTH}px`;
    } else {
      return `${SIDE_NAV_WIDTH}px`;
    }
  };

  const getLogo = () => {
    if (logoType === 'light') {
      if (navCollapsed) {
        return '/img/ukpe.png';
      }
      return '/img/ukpe_logo.png';
    }

    if (navCollapsed) {
      return '/img/ukpe.png';
    }
    return '/img/ukpe_logo_dark.png';
  };

  return (
    <LogoWrapper
      className={isMobile && !mobileLogo ? 'd-none' : 'logo'}
      isCollapsed={navCollapsed} // Pass navCollapsed as a prop
      style={{ width: `${getLogoWidthGutter()}` }}
    >
      <img src={getLogo()} alt={`${APP_NAME} logo`} height={isMobile ? '25px' : '25px'} />
    </LogoWrapper>
  );
};

export default Logo;
