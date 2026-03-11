import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'article',
  title: 'Articles',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Seasonal Guide', value: 'seasonal' },
          { title: 'Digestive Health', value: 'digestive' },
          { title: 'Elderly Care', value: 'elderly' },
          { title: 'Dental Care', value: 'dental' },
          { title: 'Product Comparison', value: 'comparison' },
          { title: 'How-To Guide', value: 'howto' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
      description: 'Brief summary shown in article cards',
      validation: Rule => Rule.required().max(300)
    }),
    defineField({
      name: 'mainImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'readTime',
      title: 'Read Time (minutes)',
      type: 'number',
      validation: Rule => Rule.required().positive().integer()
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      initialValue: 'Mohamed Al Nimer'
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string'
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'mainImage'
    }
  }
})
