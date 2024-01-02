import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Order } from "../../services/Order.service";
import { useToasts } from "react-toast-notifications";
import {
  Badge,
  Button,
  Dropdown,
  DropdownButton,
  Row,
  Table,
} from "react-bootstrap";
type Props = {};

const AllOrders = (props: Props) => {
  const { addToast } = useToasts();
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    fetchOrders();
  }, []);
  console.log(orders);
  const fetchOrders = async (status?: string) => {
    try {
      const orderRes = await Order.fetchAll(status);
      if (!orderRes.success) {
        throw new Error(orderRes.message);
      }
      setOrders(orderRes.result);
    } catch (error: any) {
      if (error.response) {
        return addToast(error.response.data.message, {
          appearance: "error",
          autoDismiss: true,
        });
      }
      return addToast(error.message, {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };
  const dateToLocal = (date: any) => {
    return new Date(date).toLocaleDateString();
  };
  return (
    <>
      <Row>
        <DropdownButton
          variant="outline-secondary"
          title="Filter by status"
          id="input-group-dropdown-2"
          onSelect={(e) => {
            fetchOrders(e ? e : "");
          }}
        >
          <Dropdown.Item href="#" eventKey="">
            All
          </Dropdown.Item>
          <Dropdown.Item href="#" eventKey="pending">
            Pending
          </Dropdown.Item>
          <Dropdown.Item href="#" eventKey="completed">
            Complete
          </Dropdown.Item>
        </DropdownButton>
      </Row>
      <Table responsive>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Order Date</th>
            <th>Order Status</th>
            <th>Order Total</th>
            <th>Order Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order: any) => (
              <tr key={order._id}>
                <Link href={`/orders/${order._id}`}>
                  <td style={{ color: "green", cursor: "pointer" }}>
                    {order.orderId}
                  </td>
                </Link>
                <td>{dateToLocal(order.createdAt)}</td>
                <td>
                  <Badge>{order.orderStatus.toUpperCase()}</Badge>
                </td>
                <td>${order.paymentInfo?.paymentAmount}</td>

                <td>
                  <Link href={`/orders/${order._id}`}>
                    <Button variant="outline-dark">View Order Details</Button>
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>No orders found</td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
};

export default AllOrders;
