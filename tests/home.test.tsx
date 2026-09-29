import {render,screen} from "@testing-library/react";
import {describe,expect,it} from "vitest";
import {PortfolioPageClient} from "@/components/portfolio/PortfolioPageClient";
import {copy,projects} from "@/lib/i18n";

describe("PortfolioPageClient",()=>{
  it("renders the career timeline and portfolio controls",()=>{
    const text=(section:string,field:string,fallback:string)=>fallback;

    render(
      <PortfolioPageClient
        locale="en"
        content={{}}
        timeline={copy.en.timeline.entries}
        projects={projects}
        social={{
          github:"https://github.com/felipe-seabra",
          linkedin:"https://www.linkedin.com/in/felipe-seabra/",
        }}
      />
    );

    expect(screen.getByText("How I got here.")).toBeInTheDocument();
    expect(screen.getByText("Technology & Education")).toBeInTheDocument();
    expect(screen.getByRole("link",{name:"Language"})).toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Theme"})).toBeInTheDocument();
  });
});
