import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import {
  BuilderComponent,
  Builder,
  builder,
  isPreviewing
} from '@builder.io/react'
import builderConfig from '../../config/builder'
import DefaultErrorPage from 'next/error'
import Head from 'next/head'
import { PersonalizedURL } from '@builder.io/personalization-utils'
import { useEffect } from 'react'
import '@builder.io/widgets'

builder.init(builderConfig.apiKey)

export async function getStaticProps({ params }) {
  const personlizedURL = PersonalizedURL.fromHash(params.hash)
  const attributes = personlizedURL.attributes
  const page =
    (await builder
      .get('page', {
        apiKey: builderConfig.apiKey,
        userAttributes: attributes,
        cachebust: true
      })
      .promise()) || null

  return {
    props: {
      page,
      attributes: attributes,
      locale: attributes.locale || 'en-US'
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 1 seconds
    revalidate: 1
  }
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true
  }
}

export default function Path({ page, attributes, locale }) {
  const router = useRouter()
  const isPreviewingInBuilder = isPreviewing()
  const show404 = !page && !isPreviewingInBuilder

  useEffect(() => {
    builder.setUserAttributes(attributes)
  }, [])

  if (router.isFallback) {
    return <h1>Loading...</h1>
  }

  const { title, description, image } = page?.data || {}
  return (
    <>
      <Head>
        {!page && <meta name="robots" content="noindex" />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <NextSeo
        title={title}
        description={description}
        openGraph={{
          type: 'website',
          title,
          description,
          images: [
            {
              url: image,
              width: 800,
              height: 600,
              alt: title
            }
          ]
        }}
      />
      {show404 ? (
        <DefaultErrorPage statusCode={404} />
      ) : (
        <BuilderComponent
          context={{ attributes }}
          data={{ attributes, locale }}
          model="page"
          content={page}
        />
      )}
    </>
  )
}
