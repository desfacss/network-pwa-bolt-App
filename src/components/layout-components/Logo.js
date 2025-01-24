import React from 'react';
import { SIDE_NAV_WIDTH, SIDE_NAV_COLLAPSED_WIDTH, NAV_TYPE_TOP } from 'constants/ThemeConstant';
import { APP_NAME } from 'configs/AppConfig';
import { useSelector } from 'react-redux';
import utils from 'utils';
import { Grid } from 'antd';
import styled from '@emotion/styled';
import { TEMPLATE } from 'constants/ThemeConstant';
import { store } from 'store';

const state = store.getState();
const workspace = state?.auth?.session?.user?.organization?.app_settings?.workspace || state?.auth?.defaultOrganization?.app_settings?.workspace || 'dev';
const name = state?.auth?.session?.user?.organization?.app_settings?.name || state?.auth?.defaultOrganization?.app_settings?.name || 'dev';

const LogoWrapper = styled.div(({ isCollapsed }) => ({
  height: TEMPLATE.HEADER_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  padding: `0 1rem`,
  paddingLeft: isCollapsed ? '28px' : '1rem',
  backgroundColor: 'transparent',
  transition: 'all 0.5s ease',
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
        return `/img/${workspace}/light.png`;
      }
      return `/img/${workspace}/logo_light.png`;
    }

    if (navCollapsed) {
      return `/img/${workspace}/dark.png`;
    }
    return `/img/${workspace}/logo_dark.png`;
  };
  console.log("logo", workspace)
  return (
    <LogoWrapper
      className={isMobile && !mobileLogo ? 'd-none' : 'logo'}
      isCollapsed={navCollapsed} // Pass navCollapsed as a prop
      style={{ width: `${getLogoWidthGutter()}` }}
    >
      {/* <img src={getLogo()} alt={`${workspace} logo`} height={isMobile ? '25px' : '25px'} /> */}
      <img
        // src={`/img/${workspace}/logo_light.png`}
        // alt={`${workspace}`}
        src={getLogo()} alt={`${workspace} logo`} height={isMobile ? '25px' : '25px'}
        style={{ height: '30px' }}
        onError={(e) => {
          e.target.style.display = 'none'; // Hide the image
          e.target.nextSibling.style.display = 'block'; // Show the h1 element
        }}
      />
      <h1 style={{ display: 'none', fontSize: '20px', margin: 0 }}>{name}</h1>
    </LogoWrapper>
  );
};

export default Logo;
