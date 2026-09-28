from django.core.management.base import BaseCommand
from catalog.models import Product
from reviews.models import Review


REVIEWS_DATA = [
    # Elegant Pearl Necklace (slug: elegant-pearl-necklace or id: 1)
    {
        'product_id': 1,
        'reviewer_name': 'Nusrat Jahan',
        'reviewer_email': 'nusrat.jahan@diu.edu.bd',
        'rating': 5,
        'title': 'Exquisite necklace for the price!',
        'body': 'Ordered this for our university cultural fest at Daffodil International University. Everyone asked where I bought it! The pearl sheen looks genuinely luxurious.',
        'is_approved': True,
        'is_featured': True,
        'helpful_count': 14,
    },
    {
        'product_id': 1,
        'reviewer_name': 'Tanima Rahman',
        'reviewer_email': 'tanima.rahman@gmail.com',
        'rating': 5,
        'title': 'Beautiful packaging and quality',
        'body': 'Packaging was so thoughtful and sweet. The pearls have a lovely luster and it sits so well on collarbone tops.',
        'is_approved': True,
        'is_featured': False,
        'helpful_count': 7,
    },
    {
        'product_id': 1,
        'reviewer_name': 'Sadia Islam',
        'reviewer_email': 'sadia.islam98@yahoo.com',
        'rating': 4,
        'title': 'Really pretty choker-length necklace',
        'body': 'Very pretty and delicate. Delivery to Mirpur 1 was completely free and arrived within 24 hours via COD.',
        'is_approved': True,
        'is_featured': False,
        'helpful_count': 3,
    },

    # Rose Gold Huggie Hoop Earrings (id: 2)
    {
        'product_id': 2,
        'reviewer_name': 'Amina Begum',
        'reviewer_email': 'amina.begum@gmail.com',
        'rating': 5,
        'title': "Doesn't irritate sensitive ears!",
        'body': 'I have very sensitive ear piercings and usually react to imitation jewellery. These hoops are super comfortable and didn’t cause any irritation after a whole day.',
        'is_approved': True,
        'is_featured': True,
        'helpful_count': 18,
    },
    {
        'product_id': 2,
        'reviewer_name': 'Farzana Haque',
        'reviewer_email': 'farzana.haque@gmail.com',
        'rating': 5,
        'title': 'My everyday go-to earrings',
        'body': 'The rose gold tone is subtle and elegant, not overly bright or yellow. 10/10 recommended for campus and work.',
        'is_approved': True,
        'is_featured': False,
        'helpful_count': 5,
    },

    # Adjustable Silver Stacking Ring (id: 3)
    {
        'product_id': 3,
        'reviewer_name': 'Mehnaz Chowdhury',
        'reviewer_email': 'mehnaz.c@hotmail.com',
        'rating': 5,
        'title': 'Adjustable fit is perfect',
        'body': 'Fits any finger easily without feeling flimsy or bendy. The silver polish is clean and shiny.',
        'is_approved': True,
        'is_featured': False,
        'helpful_count': 6,
    },
    {
        'product_id': 3,
        'reviewer_name': 'Sumaiya Akter',
        'reviewer_email': 'sumaiya.akter@diu.edu.bd',
        'rating': 4,
        'title': 'Loved the minimalist design',
        'body': 'Very neat finish and minimal aesthetic. Pairs nicely with my other accessories.',
        'is_approved': True,
        'is_featured': False,
        'helpful_count': 2,
    },

    # Gold Lucky Charm Chain Bracelet (id: 4)
    {
        'product_id': 4,
        'reviewer_name': 'Tasnim Anjum',
        'reviewer_email': 'tasnim.anjum@prime.edu.bd',
        'rating': 5,
        'title': 'Sweet gift for my best friend',
        'body': 'Gave this as a birthday gift to my friend at Prime University. She was over the moon! Free student delivery was super fast.',
        'is_approved': True,
        'is_featured': True,
        'helpful_count': 9,
    },

    # Floral Blossom Pearl Hair Pin Set (id: 5)
    {
        'product_id': 5,
        'reviewer_name': 'Rehana Parvin',
        'reviewer_email': 'rehana.p@gmail.com',
        'rating': 5,
        'title': 'Gorgeous for traditional sarees',
        'body': 'Wore these pins with a Jamdani saree for Pohela Boishakh. Stayed firmly in my hair bun without slipping.',
        'is_approved': True,
        'is_featured': False,
        'helpful_count': 11,
    },

    # Crystal Teardrop Dangle Earrings (id: 6)
    {
        'product_id': 6,
        'reviewer_name': 'Ishrat Jahan',
        'reviewer_email': 'ishrat.jahan@gmail.com',
        'rating': 5,
        'title': 'Catch the light beautifully',
        'body': 'Wore these to a wedding party. Sparkled under the lights and were not heavy on the ears at all.',
        'is_approved': True,
        'is_featured': False,
        'helpful_count': 8,
    },
    {
        'product_id': 6,
        'reviewer_name': 'Rumpa Das',
        'reviewer_email': 'rumpa.das@yahoo.com',
        'rating': 4,
        'title': 'Elegant statement earrings',
        'body': 'Great craftsmanship. Looks far more expensive than the price tag. Very satisfied.',
        'is_approved': True,
        'is_featured': False,
        'helpful_count': 4,
    },

    # Layered Gold Choker Necklace (id: 7)
    {
        'product_id': 7,
        'reviewer_name': 'Nabila Zannat',
        'reviewer_email': 'nabila.zannat@gmail.com',
        'rating': 5,
        'title': 'Instant outfit upgrade!',
        'body': 'The layered chains don’t tangle if stored properly. Gives such a chic modern vibe with plain shirts and dresses.',
        'is_approved': True,
        'is_featured': True,
        'helpful_count': 12,
    },

    # Minimalist Rose Gold Cuff Bangle (id: 17)
    {
        'product_id': 17,
        'reviewer_name': 'Shanjida Mim',
        'reviewer_email': 'shanjida.mim@gmail.com',
        'rating': 5,
        'title': 'Sleek & durable',
        'body': 'Been wearing this almost daily for 2 weeks. Has not lost its rose gold shine. Love the minimal aesthetic.',
        'is_approved': True,
        'is_featured': False,
        'helpful_count': 7,
    },

    # PENDING Reviews for Admin Moderation Test
    {
        'product_id': 16,
        'reviewer_name': 'Khadija Sultana',
        'reviewer_email': 'khadija.s@diu.edu.bd',
        'rating': 5,
        'title': 'Super sparkling bracelet!',
        'body': 'Received this morning via COD at Daffodil campus! The stones sparkle like diamonds. Highly recommended!',
        'is_approved': False,
        'is_featured': False,
        'helpful_count': 0,
    },
    {
        'product_id': 17,
        'reviewer_name': 'Anika Tabassum',
        'reviewer_email': 'anika.tabassum@gmail.com',
        'rating': 4,
        'title': 'Very pretty cuff bangle',
        'body': 'Looks sleek and stylish. Can you please bring more rose gold stacking rings to match?',
        'is_approved': False,
        'is_featured': False,
        'helpful_count': 0,
    },
]


class Command(BaseCommand):
    help = 'Seed realistic customer reviews for Flembe Essence products'

    def handle(self, *args, **options):
        created_count = 0
        for item in REVIEWS_DATA:
            try:
                product = Product.objects.get(id=item['product_id'])
            except Product.DoesNotExist:
                # Fallback to first available product
                product = Product.objects.first()
                if not product:
                    continue

            # Check if this review already exists
            exists = Review.objects.filter(
                product=product,
                reviewer_email=item.get('reviewer_email', ''),
                reviewer_name=item['reviewer_name']
            ).exists()

            if not exists:
                Review.objects.create(
                    product=product,
                    reviewer_name=item['reviewer_name'],
                    reviewer_email=item.get('reviewer_email', ''),
                    rating=item['rating'],
                    title=item['title'],
                    body=item['body'],
                    is_approved=item['is_approved'],
                    is_featured=item['is_featured'],
                    helpful_count=item['helpful_count'],
                )
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully seeded {created_count} reviews (Total reviews in DB: {Review.objects.count()}).'
            )
        )
