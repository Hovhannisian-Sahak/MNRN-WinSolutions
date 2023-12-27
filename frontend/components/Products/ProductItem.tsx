import React, { FC, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Col } from "react-bootstrap";
import { Eye, Pen, Trash, Upload } from "react-bootstrap-icons";
import StarRatingComponent from "react-star-rating-component";
import { getFormattedStringFromDays } from "../../utils";
interface Props {
  product: Record<string, any>;
  userType: string;
}

const ProductItem: FC<Props> = ({ product, userType }) => {
  console.log(product);
  console.log(userType);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Col>
      <Card className="productCard">
        <Card.Img variant="img" src={product.image} />
        <Card.Body>
          <Card.Title>{product.productName}</Card.Title>
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
          {userType === "admin" ? (
            <div className="btnGrpForProduct">
              <div className="file btn btn-md btn-outline-primary fileInputDiv">
                <Upload />
                <input
                  type="file"
                  name="file"
                  className="fileInput"
                  // onChange={uploadProductImage}
                />
              </div>
              <Link href={`/products/update-product?productId=${product?._id}`}>
                <a className="btn btn-outline-dark viewProdBtn">
                  <Pen />
                </a>
              </Link>
              <Button
                variant="outline-dark"
                className="btn btn-outline-dark viewProdBtn"
                // onClick={() => deleteProduct()}
              >
                {isLoading && (
                  <span
                    className="spinner-border spinner-border-sm mr-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                )}
                <Trash />
              </Button>
              <Link href={`/products/${product?._id}`}>
                <a className="btn btn-outline-dark viewProdBtn">
                  <Eye />
                </a>
              </Link>
            </div>
          ) : (
            <Link href={`/products/${product?._id}`}>
              <a className="btn btn-outline-dark viewProdBtn">
                <Eye />
                View Details
              </a>
            </Link>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ProductItem;
