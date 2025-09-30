import { Button } from "@/components/ui/button";
import crowdSpirit from "@/assets/crowd-spirit.jpg";
import { ShoppingBag, Heart, TrendingUp } from "lucide-react";

const SpiritWearSection = () => {
  return (
    <section id="spirit-wear" className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${crowdSpirit})` }}
      />
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            CDBL Spirit Wear
          </h2>
          <p className="text-xl mb-4 opacity-90">
            Show your Rockets pride with official CDBL merchandise!
          </p>
          <p className="text-lg mb-8 opacity-80">
            <Heart className="inline w-5 h-5 mr-2" />
            10% of all proceeds go to support the league!
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div>
                <div className="text-3xl font-bold mb-1">64+</div>
                <div className="text-sm opacity-80">Products Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">10%</div>
                <div className="text-sm opacity-80">Goes to CDBL</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">100%</div>
                <div className="text-sm opacity-80">Rockets Pride</div>
              </div>
            </div>

            <p className="text-base mb-6 leading-relaxed">
              Browse our complete collection of CDBL-branded apparel, accessories, and gear at the Strawberry Creek Creations store. From jerseys and hats to hoodies and bags, find everything you need to support your favorite team.
            </p>

            <Button 
              size="lg"
              variant="outline"
              className="bg-white text-primary hover:bg-white/90 border-0 font-bold text-base"
              onClick={() => window.open('https://strawberrycreekcreations.com/collections/cdbl_spiritwear', '_blank')}
            >
              <ShoppingBag className="mr-2" />
              Shop CDBL Spirit Wear
            </Button>
          </div>

          <p className="text-sm opacity-70">
            Official merchandise provided by Strawberry Creek Creations
          </p>
        </div>
      </div>
    </section>
  );
};

export default SpiritWearSection;
