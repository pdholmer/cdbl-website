import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ExternalLink, Shirt, CircleDollarSign } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Shop = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section 
          className="relative py-16 md:py-24 text-primary-foreground overflow-hidden"
          style={{ background: 'var(--gradient-hero)' }}
        >
          <div className="container">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">CDBL Shop</h1>
            <p className="text-xl max-w-2xl">Show your Rockets pride! Get official CDBL spirit wear and gear.</p>
          </div>
        </section>

        {/* Main Shop Section */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <Card className="border-2 border-primary">
                <CardHeader>
                  <Shirt className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-2xl">Spirit Wear Store</CardTitle>
                  <CardDescription>Official CDBL apparel and accessories</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Our official spirit wear store features t-shirts, hoodies, hats, and more with the CDBL Rockets logo. All proceeds support our league programs.
                  </p>
                  <ul className="space-y-2 text-muted-foreground mb-6">
                    <li>• T-shirts and long sleeve tees</li>
                    <li>• Hoodies and sweatshirts</li>
                    <li>• Hats and beanies</li>
                    <li>• Bags and accessories</li>
                    <li>• Custom team orders available</li>
                  </ul>
                  <Button size="lg" className="w-full" variant="hero">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Shop Spirit Wear
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Store opens December 2025
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary">
                <CardHeader>
                  <CircleDollarSign className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-2xl">Fundraiser Items</CardTitle>
                  <CardDescription>Support CDBL while getting great products</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Throughout the year, we offer special fundraising opportunities. Your purchases directly benefit CDBL field improvements and program enhancements.
                  </p>
                  <ul className="space-y-2 text-muted-foreground mb-6">
                    <li>• Annual t-shirt fundraiser</li>
                    <li>• Holiday gift items</li>
                    <li>• Car magnets and decals</li>
                    <li>• Discount cards</li>
                    <li>• Raffle tickets (special events)</li>
                  </ul>
                  <Button size="lg" className="w-full" variant="outline">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Product Categories */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Popular Items</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Tees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <Shirt className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">Moisture-wicking CDBL shirts</p>
                  <p className="text-2xl font-bold text-primary">$24.99</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rockets Cap</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <Shirt className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">Embroidered team logo cap</p>
                  <p className="text-2xl font-bold text-primary">$19.99</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hoodies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <Shirt className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">Cozy CDBL fleece hoodie</p>
                  <p className="text-2xl font-bold text-primary">$39.99</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Equipment Bag</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <Shirt className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">Durable team gear bag</p>
                  <p className="text-2xl font-bold text-primary">$34.99</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Custom Orders */}
        <section className="py-16 bg-background">
          <div className="container max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Team & Custom Orders</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-6">
                  Planning a team order or custom design? We offer bulk discounts and can work with you to create custom apparel for your team, family, or special event.
                </p>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li>• Bulk team orders (10+ items)</li>
                  <li>• Custom names and numbers</li>
                  <li>• Tournament warm-up gear</li>
                  <li>• Family packages</li>
                  <li>• Special event merchandise</li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="flex-1">
                    Request Custom Quote
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1">
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pickup Info */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Order Pickup & Shipping</h2>
            <p className="text-muted-foreground mb-8">
              Online orders can be picked up at the CDBL complex during games and events. Shipping is available for an additional fee. Allow 2-3 weeks for custom orders.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pickup Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">CDBL Main Complex</p>
                  <p className="text-muted-foreground">Burlington, IL</p>
                  <p className="text-sm text-muted-foreground mt-2">Available during games & events</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipping</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">USPS Priority Mail</p>
                  <p className="text-muted-foreground">3-5 business days</p>
                  <p className="text-sm text-muted-foreground mt-2">$7.99 flat rate shipping</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;