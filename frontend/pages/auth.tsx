import React from "react";
import RegisterLogin from "../components/Auth/RegisterLogin";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

type Props = {};

const Auth = (props: Props) => {
  return (
    <Row>
      <Col sm={6} className="mt-3">
        <RegisterLogin />
      </Col>
      <Col sm={6} className="mt-3">
        <RegisterLogin isRegisterForm={true} />
      </Col>
    </Row>
  );
};

export default Auth;
