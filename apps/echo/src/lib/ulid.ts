import { ulid } from "ulid";

/** Lexically sortable 26-char id. Use for all primary keys. */
export const newId = () => ulid();
