import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import React from "react";
import { useToasts } from "react-toast-notifications";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Col,
  Image,
  ListGroup,
  Row,
  Table,
} from "react-bootstrap";
import { Clipboard } from "react-bootstrap-icons";
interface Props {
  order: any;
}

const Order: NextPage<Props> = ({ order }) => {
  console.log(order);
  const { addToast } = useToasts();
  return (
    <>
      <Row>
        <Col>
          <Card style={{ marginTop: "20px" }}>
            <Card.Header> Order Details</Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Products</th>
                    <th>License Keys</th>
                  </tr>
                </thead>
                <tbody>
                  {order?.orderedItems?.map((item: any) => (
                    <tr key={item.skuCode}>
                      <td>
                        {" "}
                        <div>
                          <Image
                            height={50}
                            width={50}
                            roundedCircle={true}
                            src={
                              item.productImage ||
                              "https://st4.depositphotos.com/14953852/22772/v/600/depositphotos_227725020-stock-illustration-image-available-icon-flat-vector.jpg"
                            }
                            alt=""
                          />
                          <span style={{ display: "block", marginLeft: "5px" }}>
                            <Link href={`/products/${item.productId}`}>
                              <a style={{ textDecoration: "none" }}>
                                {item.productName || "Demo Product"}
                              </a>
                            </Link>
                            <p style={{ fontWeight: "bold" }}>
                              {item.quantity} X ₹{item.price}
                            </p>
                          </span>
                        </div>
                        {/* <Link href={''}>
                                            <Button variant='link'>
                                                Issue with this product? Then Contact US...
                                            </Button>
                                        </Link> */}
                      </td>
                      <td>
                        {item.licenses || " Not Found "}{" "}
                        {item.licenses && (
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(item.license);
                              addToast("License key copied successfully", {
                                appearance: "success",
                                autoDismiss: true,
                              });
                            }}
                          >
                            <Clipboard />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card style={{ marginTop: "20px" }}>
            <Card.Header>
              <Card.Title>
                Total Amout : ${order.paymentInfo?.paymentAmount}
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <ListGroup className="list-group-flush">
                <ListGroup.Item>
                  Order Date & Time: 20th Sep, 2022, 06:26PM
                </ListGroup.Item>
                <ListGroup.Item>
                  Paymnet Method:{" "}
                  {order.paymnetInfo?.paymentMethod.toUpperCase()}
                </ListGroup.Item>
                <ListGroup.Item>
                  Order Status: <Badge>{order.orderStatus.toUpperCase()}</Badge>
                </ListGroup.Item>
                <ListGroup.Item>
                  Add Line 1 : {order.customerAddress.line1}
                  <br />
                  Add Line 2 : {order.customerAddress.line2}
                  <br />
                  City : {order.customerAddress.city}
                  <br />
                  State : {order.customerAddress.state}
                  <br />
                  Country : {order.customerAddress.country}
                  <br />
                  Postal Code : {order.customerAddress.postal_code}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    if (!context.params?.id) {
      return {
        props: {
          order: {},
        },
      };
    }
    const res = await axios({
      method: "GET",
      url:
        `${
          process.env.NODE_ENV !== "production"
            ? process.env.NEXT_PUBLIC_BASE_API_URL_LOCAL
            : process.env.NEXT_PUBLIC_BASE_API_URL
        }/orders/` + context?.params?.id,
      headers: { cookie: context.req.headers.cookie },
    });
    if (!res?.data?.success) {
      return {
        props: {
          order: {},
        },
      };
    }
    return {
      props: {
        order: res?.data?.result || ({} as Record<string, any>),
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        order: {},
      },
    };
  }
};
export default Order;
