// components/PrimaryButton.js
import styled from 'styled-components';

const Button = styled.button`
  width: 145px;
  height: 50px;
  border-radius: 50px;
  background-color: var(--primary);
  border: 1.5px solid var(--primary);
  overflow: hidden;
  position: relative;
  font-size: var(--sm);
  font-weight: 500;
  text-transform: uppercase;
  transition: 300ms ease;
  cursor: pointer;
  color: var(--light);
  outline: none;

  .btntxt {
    color: var(--light) !important;
    position: relative;
    z-index: 2; /* Ensure p tag is above the ::before pseudo-element */
    font-size: var(--sm) !important;
    text-align: center;
  }

  &::before {
    content: "";
    position: absolute;
    z-index: 1;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background-color: var(--light);
    top: 100%;
    left: 0;
    transition: 500ms ease;
  }

  &:hover {
    color: var(--light);
    letter-spacing: 1.2px;
    border-color: var(--primary);

    p {
        color: var(--primary) !important;
        z-index: 3;
    }
  }

  &:hover::before {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }
`;

const PrimaryButton = ({ children }) => {
    return <Button>
        <p className='btntxt'>{children}</p>
    </Button>;
};

export default PrimaryButton;
