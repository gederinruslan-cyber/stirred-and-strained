// The isolation harness every user-owned resource runs through its repository (ADR 0003).
import { randomUUID } from "node:crypto";
import { expect } from "vitest";
import { withUser, type Db, type Scoped } from "../src/index.ts";

export type IsolatedResource = {
  create(scoped: Scoped): Promise<string>;
  read(scoped: Scoped, id: string): Promise<unknown>;
  /** Rows changed. */
  update(scoped: Scoped, id: string): Promise<number>;
  /** Rows removed. */
  remove(scoped: Scoped, id: string): Promise<number>;
};

/** User B can neither read, change nor delete user A's row by id (the api answers 404). */
export async function expectIsolated(db: Db, resource: IsolatedResource): Promise<void> {
  const [a, b] = [randomUUID(), randomUUID()];
  const id = await withUser(db, a, (s) => resource.create(s));
  const before = await withUser(db, a, (s) => resource.read(s, id));
  expect(before).not.toBeNull();
  expect(await withUser(db, b, (s) => resource.read(s, id))).toBeNull();
  expect(await withUser(db, b, (s) => resource.update(s, id))).toBe(0);
  expect(await withUser(db, b, (s) => resource.remove(s, id))).toBe(0);
  expect(await withUser(db, a, (s) => resource.read(s, id))).toEqual(before);
}
