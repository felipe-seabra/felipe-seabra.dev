import {describe,expect,it} from "vitest";
import {render,screen} from "@testing-library/react";
import Home from "@/app/page";

describe("Home",()=>{it("renders portfolio content",()=>{render(<Home/>);expect(screen.getByText("Felipe")).toBeInTheDocument();expect(screen.getByText("Built to matter.")).toBeInTheDocument()})});
