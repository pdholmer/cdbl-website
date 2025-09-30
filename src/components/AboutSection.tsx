import cdblSeal from "@/assets/cdbl-seal.png";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Welcome to CDBL
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              The Central District Baseball League has proudly served Burlington, IL and the surrounding community for over three decades. As a non-profit organization, we're committed to providing exceptional youth baseball programs that emphasize skill development, teamwork, and the pure joy of the game.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our mission is simple: foster a love of baseball while creating lasting memories and friendships. Whether your child is just starting out or looking to take their game to the next level with our Travel teams, CDBL offers programs designed to help every player succeed.
            </p>
          </div>
          <div className="flex justify-center">
            <img 
              src={cdblSeal} 
              alt="CDBL Seal" 
              className="w-full max-w-md h-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
