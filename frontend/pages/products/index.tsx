import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import React, { useContext, useEffect, useState } from "react";
import queryString from "query-string";
import { Col, DropdownButton, Dropdown, Row } from "react-bootstrap";
import BreadcrumbDisplay from "../../components/shared/BreadcrumbDisplay";
import { useRouter } from "next/router";
import ProductFilter from "../../components/Products/ProductFilter";
import ProductItem from "../../components/Products/ProductItem";
import PaginationDisplay from "../../components/shared/PaginationDisplay";
import Link from "next/link";
import { Context } from "../../context";
import { PlusCircle } from "react-bootstrap-icons";
interface Props {
  products: Record<string, any>[];
  metadata: Record<string, any>;
}

const AllProducts: NextPage<Props> = ({ products, metadata }) => {
  const [userType, setUserType] = useState("customer");
  const [sortText, setSortText] = useState("Sort By");
  const router = useRouter();
  const {
    state: { user },
  } = useContext(Context);
  useEffect(() => {
    if (user) {
      setUserType(user.type);
    }
  }, [user]);

  return (
    <>
      <Row>
        <Col md={8}>
          <BreadcrumbDisplay
            childrens={[
              { active: false, href: "/", text: "Home" },
              {
                active: true,
                href: "",
                text: "Products",
              },
            ]}
          />
        </Col>
        <Col md={4}>
          <DropdownButton
            variant="outline-secondary"
            id="input--group-dropdown-2"
            title={sortText}
            onSelect={(e) => {
              if (e) {
                setSortText(
                  e === "-avgRating"
                    ? "Rating"
                    : e === "-createdAt"
                    ? "Latest"
                    : "Sort By"
                );
                delete router.query.offset;
                router.query.sort = e;
                router.push(router);
              } else {
                delete router.query.sort;
                router.push(router);
              }
            }}
          >
            <Dropdown.Item href="#" eventKey="-avgRating">
              Rating {userType + "hh"}
            </Dropdown.Item>
            <Dropdown.Item href="#" eventKey="-createdAt">
              Latest
            </Dropdown.Item>
            <Dropdown.Item href="#" eventKey="">
              Reset
            </Dropdown.Item>
          </DropdownButton>

          {userType === "admin" && (
            <Link href="/products/update-product">
              <a className="btn btn-primary btnAddProduct">
                <PlusCircle className="btnAddProductIcon" />
                Add Product
              </a>
            </Link>
          )}
        </Col>
      </Row>
      <Row>
        <Col sm={2}>
          <ProductFilter />
        </Col>
        <Col sm={10}>
          <Row xs={1} md={3} className="g-3">
            {products && products.length > 0 ? (
              products.map((product) => (
                <ProductItem
                  key={product._id}
                  product={product}
                  userType={userType}
                />
              ))
            ) : (
              <h3>No Products found!</h3>
            )}{" "}
          </Row>
        </Col>
      </Row>
      <Row>
        <Col>
          <PaginationDisplay metadata={metadata} />
        </Col>
      </Row>
    </>
  );
};
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const url = queryString.stringifyUrl({
      url: `${
        process.env.NODE_ENV !== "production"
          ? process.env.NEXT_PUBLIC_BASE_API_URL_LOCAL
          : process.env.NEXT_PUBLIC_BASE_API_URL
      }/products`,
      query: context.query,
    });

    const res = await axios({
      method: "GET",
      url,
      headers: { cookie: context.req.headers.cookie },
    });
    console.log(res);
    return {
      props: {
        products: res?.data?.result?.products || {},
        metadata: res?.data?.result?.metadata || {},
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        products: {},
        metadata: {},
      },
    };
  }
};

export default AllProducts;
