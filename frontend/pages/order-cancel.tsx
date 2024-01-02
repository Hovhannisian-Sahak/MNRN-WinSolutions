import React, { useContext, useEffect } from "react";
import { Context } from "../context";
import { useRouter } from "next/router";
import Link from "next/link";
import { Col, Row } from "react-bootstrap";

type Props = {};

const OrderCancel = (props: Props) => {
  const {
    state: { user },
  } = useContext(Context);
  const router = useRouter();
  useEffect(() => {
    if (!user || !user.email) {
      router.push("/");
    }
  }, [user, router]);
  return (
    <Row>
      <Col md={{ span: 6, offset: 3 }}>
        <div className="jumbotron text-center">
          <h1 className="display-3 text-danger">Opps! Cancelled !</h1>
          <p className="lead">
            <strong>Payment failed !</strong> Your order got cancelled. Please
            try again.
          </p>
          <hr />
          <p className="lead">
            <Link href="/products">
              <a className="btn btn-secondary btn-sm" role="button">
                Shop More
              </a>
            </Link>
          </p>
        </div>
      </Col>
    </Row>
  );
};

export default OrderCancel;
