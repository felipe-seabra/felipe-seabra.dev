import {describe,expect,it} from "vitest";
import {render,screen} from "@testing-library/react";
import Home from "@/app/page";

describe("Home",()=>{
  it("renders the career timeline and portfolio controls",()=>{
    render(<Home/>);
    expect(screen.getByText("How I got here.")).toBeInTheDocument();
    expect(screen.getByText("Technology & Education")).toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Language"})).toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Theme"})).toBeInTheDocument();
  });
});