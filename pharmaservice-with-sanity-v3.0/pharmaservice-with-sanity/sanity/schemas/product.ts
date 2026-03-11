import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'product',
  title: 'Products',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
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
          { title: 'Digestive Health', value: 'digestive' },
          { title: 'Elderly Care', value: 'elderly' },
          { title: 'Dental Care', value: 'dental' },
          { title: 'Skin Care', value: 'skincare' },
          { title: 'Insect Protection', value: 'insect' },
          { title: 'First Aid', value: 'firstaid' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'price',
      title: 'Price (AED)',
      type: 'number',
      validation: Rule => Rule.required().positive()
    }),
    defineField({
      name: 'unit',
      title: 'Price Unit',
      type: 'string',
      placeholder: 'e.g., / box, / pack, / bottle',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Brief product claim (appears on cards)',
      validation: Rule => Rule.required().max(200)
    }),
    defineField({
      name: 'whyWeChoseThis',
      title: 'Why We Chose This',
      type: 'text',
      rows: 5,
      description: 'Editorial explanation of why this product is recommended',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'verdict',
      title: 'Verdict Badge',
      type: 'string',
      description: 'e.g., "Editor\'s Pick", "Only in UAE", "Zinc-Free"'
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'mohRegistration',
      title: 'MOH Registration Number',
      type: 'string'
    }),
    defineField({
      name: 'fullDescription',
      title: 'Full Description',
      type: 'array',
      of: [{ type: 'block' }]
    }),
    defineField({
      name: 'ingredients',
      title: 'Key Ingredients',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Custom title for search engines (leave empty to use product name)'
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      description: 'Meta description for search engines'
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'mainImage'
    }
  }
})
