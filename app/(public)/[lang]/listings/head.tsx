export default function ListingsHead() {
  return (
    <>
      <link rel="preload" as="style" href="/styles/listings-deferred.css" />
      <link
        rel="stylesheet"
        href="/styles/listings-deferred.css"
        media="print"
        id="listings-deferred-css"
      />
      <script
        dangerouslySetInnerHTML={{
          __html:
            "const listingsCss=document.getElementById('listings-deferred-css');if(listingsCss){listingsCss.addEventListener('load',()=>{listingsCss.media='all';});}",
        }}
      />
      <noscript>
        <link rel="stylesheet" href="/styles/listings-deferred.css" />
      </noscript>
    </>
  )
}
