import {routes} from './routes';

describe("routes.ts", () => {
  it("has correct count of routes", () => {
    expect(routes.length).equals(8)
  })
})
