import { Container } from "react-bootstrap";
import SocialRow from "./SocialRow";

export default function Socials() {
  return (
    <>
      <Container fluid>{SocialRow()}</Container>
    </>
  );
}
