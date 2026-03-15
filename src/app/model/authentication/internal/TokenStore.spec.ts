import {TokenStore} from './TokenStore';
import {beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';

describe("TokenStore", () => {
  let subject: TokenStore

  beforeEach(() => {
    subject = TestBed.inject(TokenStore)
  })

  it("Setting/Unsetting access token works", () => {
    expect(subject.getAccess()).equals(null)
    expect(subject.getAccessOrEmpty()).equals("")

    subject.setAccess("access-token")

    expect(subject.getAccess()).equals("access-token")
    expect(subject.getAccessOrEmpty()).equals("access-token")

    subject.setAccess(null)

    expect(subject.getAccess()).equals(null)
    expect(subject.getAccessOrEmpty()).equals("")
  })

  it("Setting/Unsetting refresh token works", () => {
    expect(subject.getRefresh()).equals(null)
    expect(subject.getRefreshOrEmpty()).equals("00000000-0000-0000-0000-000000000000")

    subject.setRefresh("refresh-token")

    expect(subject.getRefresh()).equals("refresh-token")
    expect(subject.getRefreshOrEmpty()).equals("refresh-token")

    subject.setRefresh(null)

    expect(subject.getRefresh()).equals(null)
    expect(subject.getRefreshOrEmpty()).equals("00000000-0000-0000-0000-000000000000")
  })
});
