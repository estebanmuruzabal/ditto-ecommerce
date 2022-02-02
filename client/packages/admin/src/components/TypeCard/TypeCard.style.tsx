import { styled } from 'baseui';

export const TypeCardWrapper = styled('div', ({ $theme }) => ({
  height: '100%',
  width: '100%',
  backgroundColor: '#ffffff',
  position: 'relative',
  fontFamily: $theme.typography.primaryFontFamily,
  cursor: 'pointer',
}));

export const TypeName = styled('h3', ({ $theme }) => ({
  ...$theme.typography.fontBold16,
  color: $theme.colors.textDark,
  margin: '0 0 7px 0',
  minHeight: '48px',

  '@media only screen and (max-width: 767px)': {
    ...$theme.typography.fontBold14,
    margin: '0 0 5px 0',
  },
}));
export const TypeSlug = styled('h3', ({ $theme }) => ({
  ...$theme.typography.fontBold16,
  color: $theme.colors.textDark,
  margin: '0 0 7px 0',
  minHeight: '48px',

  '@media only screen and (max-width: 767px)': {
    ...$theme.typography.fontBold14,
    margin: '0 0 5px 0',
  },
}));

export const TypeInfo = styled('div', ({ $theme }) => ({
  padding: '20px 25px 30px',

  '@media only screen and (max-width: 767px)': {
    padding: '15px 20px',
    // minHeight: '123px',
  },
}));

