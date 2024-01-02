import React, { FC, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Col } from "react-bootstrap";
import { Eye, Pen, Trash, Upload } from "react-bootstrap-icons";
import StarRatingComponent from "react-star-rating-component";
import { getFormattedStringFromDays } from "../../utils";
import { isArray } from "util";
import { useToasts } from "react-toast-notifications";
import { useRouter } from "next/router";
import { Product } from "../../services/Product.services";
interface Props {
  product: Record<string, any>;
  userType: string;
}

const ProductItem: FC<Props> = ({ product, userType }) => {
  const { addToast } = useToasts();
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const deleteProduct = async () => {
    try {
      setIsLoading(true);
      const deleteconfirm = confirm(
        "Want o delete?you will lost all skus licenses for this product"
      );
      if (deleteconfirm) {
        const res = await Product.deleteProduct(product._id);
        if (!res.success) {
          throw new Error(res.message);
        }
        addToast(res.message, {
          appearance: "success",
          autoDismiss: true,
        });
        router.push("/products");
      }
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
  const uploadProductImage = async (e: any) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("productImage", file);
      const res = await Product.uploadProductImage(product._id, formData);
      if (!res.success) {
        throw new Error(res.message);
      }
      console.log(res);
      product.image = res.result;
      addToast(res.message, { appearance: "success", autoDismiss: true });
      router.push("/products");
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
    <Col>
      <Card className="productCard">
        <Card.Img
          variant="img"
          src={
            uploading
              ? "https://www.ebi.ac.uk/training/progressbar.gif"
              : product?.image
          }
        />
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
                  onChange={uploadProductImage}
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
                onClick={() => deleteProduct()}
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
