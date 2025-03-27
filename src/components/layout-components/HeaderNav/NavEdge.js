import styled from '@emotion/styled';

const NavEdge = styled.div(({ left, right, center }) => {
  if (left) {
    return {
      display: 'flex',
    };
  }

  if (right) {
    return {
      marginLeft: 'auto',
      padding: '0 1rem',
      display: 'flex',
    };
  }

  if (center) {
    return {
      flex: 1, // Allow it to grow and take available space
      display: 'flex',
      justifyContent: 'center', // Center horizontally
      alignItems: 'center', // Center vertically
    };
  }

  return {};
});

export default NavEdge;