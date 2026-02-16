export function GET() {
  const body = `Contact: mailto:security@remmik.com
Preferred-Languages: en, da
Canonical: https://remmik.com/.well-known/security.txt
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  });
}
