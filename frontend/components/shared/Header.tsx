import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { Badge, Button } from "react-bootstrap";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import { PersonCircle, Search } from "react-bootstrap-icons";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import styles from "../../styles/Home.module.css";
import { useRouter } from "next/router";
import React, { useContext } from "react";

type Props = {};

const Header = (props: Props) => {
  const router = useRouter();
  return (
    <>
      <Row className="mt-3">
        <Col xs={6} md={4}>
          <h3 className={styles.logoHeading} onClick={() => router.push("/")}>
            WinSolutions
          </h3>
        </Col>
        <Col xs={6} md={4}>
          <InputGroup>
            <InputGroup.Text id="search">
              <Search />
            </InputGroup.Text>
            <Form.Control
              aria-label="search"
              placeholder="the product here..."
            />
            <Button variant="outline-secondary" id="button-addon2">
              Search
            </Button>
          </InputGroup>
        </Col>
        <Col xs={6} md={4}>
          <PersonCircle
            height="40"
            width="40"
            color="#4c575f"
            className={styles.personIcon}
          />
        </Col>
      </Row>
      <Navbar
        collapseOnSelect
        expand="lg"
        bg="light"
        variant="light"
        color="#4c575f"
      >
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={() => router.push("/")}>Home </Nav.Link>
            <NavDropdown title="Products" id="collasible-nav-dropdown">
              <NavDropdown.Item>Computer</NavDropdown.Item>
              <NavDropdown.Item>Mobile</NavDropdown.Item>
              <NavDropdown.Item>All</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <Nav.Link className={styles.cartItems}>
              Items: <Badge bg="secondary">5</Badge>(₹6250)
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};

export default Header;
