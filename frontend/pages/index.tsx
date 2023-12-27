import { GetServerSideProps, NextPage } from "next";
import React, { useEffect } from "react";
import { Row, Col, Button } from "react-bootstrap";
import styles from "../styles/Home.module.css";
import ProductItem from "../components/Products/ProductItem";
import { useRouter } from "next/router";
import axios from "axios";
interface Props {
  products: Record<string, any>;
  message: string;
}

const Home: NextPage<Props> = ({ products, message }) => {
  console.log(products);
  console.log(message);
  const router = useRouter();

  return (
    <>
      <h3 className={styles.productCats}>Latest Products</h3>
      <Row xs={1} md={4} className="g-4">
        {products &&
          products.latestProducts &&
          products.latestProducts.map((product: any, index: React.Key) => (
            <ProductItem product={product} userType={"customer"} key={index} />
          ))}
      </Row>
      <hr />
      <h3 className={styles.productCats}>Top Rated Products</h3>
      <Row xs={1} md={4} className="g-4">
        {products &&
          products.topRatedProducts &&
          products.topRatedProducts.map(
            (product: any, index: React.Key | null | undefined) => (
              <ProductItem
                product={product}
                userType={"customer"}
                key={index}
              />
            )
          )}
      </Row>
      <Row>
        <Col>
          <Button
            variant="primary"
            className={styles.viewMoreBtn}
            onClick={() => router.push("/products")}
          >
            View More
          </Button>
        </Col>
      </Row>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const host =
      process.env.NODE_ENV !== "production"
        ? process.env.NEXT_PUBLIC_BASE_API_URL_LOCAL
        : process.env.NEXT_PUBLIC_BASE_API_URL;
    const res = await axios({
      method: "GET",
      url: `${host}/products?homepage=true`,
      headers: { cookie: context.req.headers.cookie },
    });
    console.log(res);
    return {
      props: {
        products: res.data.result[0] || {},
        message: "barev",
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        products: {},
        message: "Error fetching data",
      },
    };
  }
};

export default Home;
