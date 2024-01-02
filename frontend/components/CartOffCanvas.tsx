import { useRouter } from "next/router";
import React, { FC, useContext, useState } from "react";
import { Offcanvas, Button } from "react-bootstrap";
import { useToasts } from "react-toast-notifications";
import CartItems from "./CartItems";
import { Order } from "../services/Order.service";
import { Context } from "../context";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
}

const CartOffCanvas: FC<Props> = ({ show, setShow }: Props) => {
  const { addToast } = useToasts();
  const router = useRouter();
  const { cartItems, cartDispatch } = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);
  const handleClose = () => {
    setShow(false);
  };
  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      console.log(cartItems);
      const res = await Order.checkoutSession(cartItems);
      if (!res.success) {
        throw new Error(res.message);
      }
      console.log(res);
      router.push(res.result);
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
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title> Shopping Cart</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <CartItems />
          <Button
            variant="primary"
            style={{ width: "100%" }}
            disabled={isLoading}
            onClick={() => handleCheckout()}
          >
            {isLoading && (
              <span
                className="spinner-border spinner-border-sm mr-2"
                role="status"
                aria-hidden="true"
              ></span>
            )}
            Checkout
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default CartOffCanvas;
