import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { Badge, Button } from "react-bootstrap";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import { PersonCircle, Search } from "react-bootstrap-icons";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import styles from "../../styles/Home.module.css";
import { useRouter } from "next/router";
import React, { useContext, useState } from "react";
import { Context } from "../../context";
import CartOffCanvas from "../CartOffCanvas";

type Props = {};

const Header = (props: Props) => {
  const [searchText, setSearchText] = useState("");
  const [baseType, setBaseType] = useState("Products");
  const [show, setShow] = useState(false);
  const {
    state: { user },
    cartItems,
  } = useContext(Context);
  const search = () => {
    router.push(`/products?search=${searchText}`);
  };
  const router = useRouter();
  console.log(cartItems);
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
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
              onKeyPress={(e) => e.key === "Enter" && search()}
            />
            <Button
              variant="outline-secondary"
              id="button-addon2"
              onClick={() => search()}
            >
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
            onClick={() => router.push("/my-account")}
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
            <NavDropdown
              title={baseType}
              id="collasible-nav-dropdown"
              onSelect={(e) => {
                setBaseType(e as string);
                e === "All"
                  ? router.push("/products")
                  : router.push(`products?baseType=${e}`);
              }}
            >
              <NavDropdown.Item eventKey="Computer">Computer</NavDropdown.Item>
              <NavDropdown.Item eventKey="Mobile">Mobile</NavDropdown.Item>
              <NavDropdown.Item eventKey="All">All</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <Nav.Link
              className={styles.cartItems}
              onClick={() => setShow(true)}
            >
              Items: <Badge bg="secondary">{cartItems.length}</Badge>(${" "}
              {cartItems &&
                cartItems
                  ?.map(
                    (item: { quantity: number; price: number }) =>
                      Number(item.price) * Number(item.quantity)
                  )
                  .reduce((a: number, b: number) => a + b, 0)}
              )
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <CartOffCanvas setShow={setShow} show={show} />
    </>
  );
};

export default Header;
