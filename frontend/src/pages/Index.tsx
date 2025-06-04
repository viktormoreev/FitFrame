
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/10 z-10" />
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
            alt="Fashion"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 md:px-8 relative z-20">
          <div className="max-w-xl text-white">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 animate-fade-in">
              Find Your Perfect Fit
            </h1>
            <p className="text-xl mb-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
              Discover clothing that's made for your body. Personalized recommendations based on your measurements.
            </p>
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <Link to="/welcome">
                <Button className="bg-fashion-gold text-white hover:bg-fashion-gold/90 text-lg px-8 py-6">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20 bg-fashion-cream">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-serif text-center mb-12">
            How Fashion Fit Finder Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-fashion-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-fashion-gold">1</span>
              </div>
              <h3 className="text-xl font-medium mb-4">Share Your Measurements</h3>
              <p className="text-gray-600">
                Upload a photo and enter your waist and hip measurements for personalized recommendations.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-fashion-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-fashion-gold">2</span>
              </div>
              <h3 className="text-xl font-medium mb-4">Get Personalized Styles</h3>
              <p className="text-gray-600">
                Our algorithm suggests clothes that will fit and flatter your body shape perfectly.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 bg-fashion-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-fashion-gold">3</span>
              </div>
              <h3 className="text-xl font-medium mb-4">Shop With Confidence</h3>
              <p className="text-gray-600">
                Browse recommended items and shop directly with partner brands knowing they'll fit just right.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Feature Highlight */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Find Clothes That Actually Fit
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Say goodbye to returns and disappointing purchases. With Fashion Fit Finder, you'll discover clothes that are perfect for your body shape and size.
              </p>
              <ul className="space-y-4">
                {[
                  "Personalized size recommendations",
                  "Brands that cater to your measurements",
                  "Special offers customized to your body type",
                  "Access to the latest styles that will fit you perfectly"
                ].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-fashion-gold mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/register">
                  <Button className="bg-fashion-gold text-white hover:bg-fashion-gold/90">
                    Try It Now
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1972&auto=format&fit=crop"
                alt="Fashion Fitting"
                className="rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                <p className="font-medium text-fashion-gold">95%</p>
                <p className="text-sm">Perfect fit satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 bg-fashion-cream">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-serif text-center mb-12">
            What Our Users Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "I've never had pants fit so well without trying them on. This app is a game-changer!",
                author: "Sarah K.",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
              },
              {
                quote: "Shopping for my body type has always been a challenge until I found Fashion Fit Finder.",
                author: "Maya T.",
                image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop"
              },
              {
                quote: "The app recommended brands I'd never heard of that are perfect for my shape!",
                author: "Jessica L.",
                image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=1974&auto=format&fit=crop"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm relative">
                <div className="mb-6">
                  <svg className="w-8 h-8 text-fashion-gold/30" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="mb-6 text-gray-600">{testimonial.quote}</p>
                <div className="flex items-center">
                  <img src={testimonial.image} alt={testimonial.author} className="w-10 h-10 rounded-full object-cover mr-4" />
                  <span className="font-medium">{testimonial.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">
            Ready to Find Your Perfect Fit?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Join Fashion Fit Finder today and discover clothing that's made for your body. It only takes a minute to get started.
          </p>
          <Link to="/welcome">
            <Button className="bg-fashion-gold text-white hover:bg-fashion-gold/90 text-lg px-8 py-6">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-fashion-charcoal text-white py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-serif mb-4">Fashion Fit Finder</h3>
              <p className="text-gray-400 max-w-xs">
                Personalized clothing recommendations based on your measurements.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Fashion Fit Finder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
