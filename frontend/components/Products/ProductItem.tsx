import React, { FC } from "react";
import Link from "next/link";
import { Badge, Card, Col } from "react-bootstrap";
import { Eye } from "react-bootstrap-icons";
import StarRatingComponent from "react-star-rating-component";
import { getFormattedStringFromDays } from "../../utils";
interface Props {
  product: Record<string, any>;
  userType: string;
}

const ProductItem: FC<Props> = ({ product, userType }) => {
  return (
    <Col>
      <Card>
        <Card.Body>
          <StarRatingComponent
            name="rate2"
            editing={false}
            starCount={5}
            value={product?.avgRating || 0}
          />
          <Card.Text>
            <span className="priceText">
              <span className="priceText">
                {product?.skuDetails
                  ? product?.skuDetails.length > 1
                    ? `₹${Math.min.apply(
                        Math,
                        product?.skuDetails.map(
                          (item: { price: number }) => item.price
                        )
                      )}-₹${Math.max.apply(
                        Math,
                        product?.skuDetails.map(
                          (item: { price: number }) => item.price
                        )
                      )}`
                    : `₹${product?.skuDetails?.[0]?.price || "000"}`
                  : "₹000"}
              </span>
            </span>
          </Card.Text>
          {product?.skuDetails &&
            product?.skuDetails.length > 0 &&
            product.skuDetails
              .sort(
                (a: { validity: number }, b: { validity: number }) =>
                  a.validity - b.validity
              )
              .map((sku: any, index: React.Key) => (
                <Badge key={index} bg="warning" text="dark" className="skuBtn">
                  {sku.lifetime
                    ? "LifeTime"
                    : getFormattedStringFromDays(sku.validity)}
                </Badge>
              ))}
          <br />
          <Link href={"/"}>
            <a className="btn btn-outline-dark viewProdBtn">
              <Eye /> View Details
            </a>
          </Link>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ProductItem;
