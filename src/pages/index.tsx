import Cascader from "..";
import { useState } from "react";

const addressOptions = [
  {
    label: "India",
    value: "in",
    children: [
      {
        label: "Delhi",
        value: "delhi",
        children: [
          {
            label: "New Delhi",
            value: "newdelhi",
            children: [
              {
                label: "Connaught Place",
                value: "connaughtplace",
              },
              {
                label: "Karol Bagh",
                value: "karolbagh",
              },
            ],
          },
          {
            label: "South Delhi",
            value: "southdelhi",
            children: [
              {
                label: "Saket",
                value: "saket",
              },
              {
                label: "Hauz Khas",
                value: "hauzkhas",
              },
            ],
          },
        ],
      },
      {
        label: "Mumbai",
        value: "mumbai",
        children: [
          {
            label: "South Mumbai",
            value: "southmumbai",
            children: [
              {
                label: "Colaba",
                value: "colaba",
              },
              {
                label: "Nariman Point",
                value: "narimanpoint",
              },
            ],
          },
          {
            label: "Western Suburbs",
            value: "westernsuburbs",
            children: [
              {
                label: "Andheri",
                value: "andheri",
              },
              {
                label: "Bandra",
                value: "bandra",
              },
            ],
          },
        ],
      },
      {
        label: "Kolkata",
        value: "kolkata",
        children: [
          {
            label: "North Kolkata",
            value: "northkolkata",
            children: [
              {
                label: "Shyambazar",
                value: "shyambazar",
              },
              {
                label: "Dum Dum",
                value: "dumdum",
              },
            ],
          },
          {
            label: "South Kolkata",
            value: "southkolkata",
            children: [
              {
                label: "Park Street",
                value: "parkstreet",
              },
              {
                label: "Gariahat",
                value: "gariahat",
              },
            ],
          },
        ],
      },
      {
        label: "Chennai",
        value: "chennai",
        children: [
          {
            label: "North Chennai",
            value: "northchennai",
            children: [
              {
                label: "George Town",
                value: "georgetown",
              },
              {
                label: "Parrys",
                value: "parrys",
              },
            ],
          },
          {
            label: "South Chennai",
            value: "southchennai",
            children: [
              {
                label: "Mylapore",
                value: "mylapore",
              },
              {
                label: "Adyar",
                value: "adyar",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    label: "United States",
    value: "unitedstates",
    children: [
      {
        label: "New York",
        value: "newyork",
        children: [
          {
            label: "Manhattan",
            value: "manhattan",
            children: [
              {
                label: "Central Park",
                value: "centralpark",
              },
              {
                label: "Times Square",
                value: "timessquare",
              },
            ],
          },
          {
            label: "Brooklyn",
            value: "brooklyn",
            children: [
              {
                label: "Williamsburg",
                value: "williamsburg",
              },
              {
                label: "DUMBO",
                value: "dumbo",
              },
            ],
          },
        ],
      },
      {
        label: "California",
        value: "california",
        children: [
          {
            label: "Los Angeles",
            value: "losangeles",
            children: [
              {
                label: "Hollywood",
                value: "hollywood",
              },
              {
                label: "Santa Monica",
                value: "santamonica",
              },
            ],
          },
          {
            label: "San Francisco",
            value: "sanfrancisco",
            children: [
              {
                label: "Golden Gate Bridge",
                value: "goldengatebridge",
              },
              {
                label: "Fisherman's Wharf",
                value: "fishermanswharf",
              },
            ],
          },
        ],
      },
    ],
  },
];

export default function Home() {
  const [inputValue, setInputValue] = useState("");

  const onChange = (value: any, selectedOptions: any) => {
    console.log(value, selectedOptions);
    setInputValue(selectedOptions.map((o: any) => o.label).join(", "));
  };

  const multiple = false;

  const prefixCls = multiple ? "catalyst-multi-cascader" : "catalyst-cascader";

  return (
    <main>
      <Cascader
        options={addressOptions}
        grouping
        showLocalSearch
        showSearch={
          multiple
            ? {
                filter: (inputValue: string, path: any) => {
                  return path.some(
                    (option: any) =>
                      option.label
                        .toLowerCase()
                        .indexOf(inputValue.toLowerCase()) > -1
                  );
                },
              }
            : true
        }
        onChange={onChange}
        prefixCls={prefixCls}
      />
    </main>
  );
}
