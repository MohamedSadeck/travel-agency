import { redirect } from "react-router";

export const loader = async () => redirect('/dashboard');

export default function Home() {
  return null;
}
