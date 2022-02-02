import styled from 'styled-components';
export default function ErrorMessageTwo({ message }) {
  return <StyledAside>{message}</StyledAside>;
}

const StyledAside = styled.aside({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '50vh',
  padding: '80px 1.5rem 0',
  fontSize: '22px',
  color: '#c60505',
  backgroundColor: '#fff',
});
