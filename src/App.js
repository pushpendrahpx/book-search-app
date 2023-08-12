import logo from "./logo.svg";
import "./App.css";
import { Button, Input, List, Select, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
const fetchBooks = async (setState) => {
  setState((prev) => {
    return { ...prev, isLoading: true };
  });
  let response = await fetch(
    "https://raw.githubusercontent.com/ozlerhakan/mongodb-json-files/master/datasets/books.json"
  );
  if (response.ok) {
    let tdata = await response.text();
    let tdatas = tdata.split("\n");
    let data = tdatas.map((eachtdata) => {
      try {
        return JSON.parse(eachtdata);
      } catch (error) {
        return null;
      }
    });
    data = data.filter((eachdata) => {
      return eachdata !== null;
    });
    console.log(data);
    message.success("Books Data Loaded Successfully!");
    setState((prev) => {
      return { ...prev, books: data, isLoading: false, keyword: "" };
    });
  } else {
    console.log("Error");
    message.error("Failed to Load Books Data!");
  }
};

const EachBookItem = ({ data }) => {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div
      style={{
        width: "100%",
        textAlign: "left",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex" }}>
        <div>
          {" "}
          <img src={data.thumbnailUrl} width={collapsed ? "30px" : "auto"} />
        </div>
        <div style={{ marginLeft: collapsed ? "10px" : "20px" }}>
          <Typography.Title level={5} style={{ margin: "0" }}>
            {data.title} [ {data.status} ]
          </Typography.Title>
          {collapsed ? null : (
            <div>
              <b>Authors</b> - {data.authors.join(", ")} <br />
              <b>Published Date</b> -{" "}
              {new Date(data.publishedDate.$date).toDateString()}
              <br />
              <b>Page Count</b> - {data.pageCount} <br />
              <b>Categories</b> - {data.categories.join(", ")} <br />
              <b>ISBN</b> - {data.isbn} <br />
            </div>
          )}
        </div>
      </div>
      <Button
        type="text"
        shape="circle"
        onClick={() => setCollapsed((prev) => !prev)}
      >
        {!collapsed ? <CaretUpOutlined /> : <CaretDownOutlined />}
      </Button>
    </div>
  );
};
// BooksList Component
const BooksList = ({ data, isLoading }) => {
  return (
    <List
      dataSource={data}
      pagination={{ position: "both", align: "start" }}
      loading={isLoading}
      id="_id"
      renderItem={(item, index) => (
        <List.Item>
          {" "}
          <EachBookItem data={item} />{" "}
        </List.Item>
      )}
    />
  );
};
function App() {
  const [state, setState] = useState({
    books: [],
    filtered: [],
    keyword: undefined,
    isLoading: false,
    categories: [],
    selectedCategory: "All",
  });
  useEffect(() => {
    fetchBooks(setState);
  }, []);
  useEffect(() => {
    let filtered = state.books.filter((book) => {
      return book.title.toLowerCase().includes(state.keyword.toLowerCase());
    });
    setState((prev) => {
      return { ...prev, filtered: filtered };
    });
  }, [state.keyword]);
  useEffect(() => {
    let set = new Set();
    for (let book of state.books) {
      for (let category of book.categories) {
        if (category.length > 0) set.add(category);
      }
    }
    setState((prev) => {
      return { ...prev, categories: [...set] };
    });
  }, [state.books]);
  useEffect(() => {
    if (state.selectedCategory == "All") {
      setState((prev) => {
        return { ...prev, filtered: state.books };
      });
    } else {
      let filtered = state.books.filter((book) => {
        return book.categories.includes(state.selectedCategory);
      });
      setState((prev) => {
        return { ...prev, filtered: filtered };
      });
    }
  }, [state.selectedCategory]);
  return (
    <div className="App" style={{ padding: "40px" }}>
      <Typography.Title level={1}>Book Search App</Typography.Title>
      <Input
        value={state.keyword}
        size="large"
        placeholder="Search books here"
        onChange={(e) => {
          setState((prev) => {
            return { ...prev, keyword: e.target.value };
          });
        }}
      />
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "start",
          padding: "20px 0 0 0",
        }}
      >
        {" "}
        <Select
          size="large"
          defaultValue="All"
          style={{ width: "max-content", minWidth: "200px" }}
          onChange={(e) => {
            console.log(e);
            setState((prev) => {
              return { ...prev, selectedCategory: e };
            });
          }}
          options={[
            { value: "All", label: "All" },
            ...state.categories.map((category) => {
              return { value: category, label: category };
            }),
          ]}
        />
      </div>
      <BooksList data={state.filtered} isLoading={state.isLoading} />
    </div>
  );
}

export default App;
