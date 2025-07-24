"use client";

import React from "react";
import { Gravity, MatterBody } from "@/Components/UI/Gravity";
import {
  ShoppingBag,
  Search,
  TrendingUp,
  Upload,
  Star,
  Users,
  DollarSign,
  Heart,
  Bookmark,
  Eye,
  Filter,
  Trophy,
  Rocket,
  ChevronRight,
  Zap,
  Globe,
  MessageCircle,
  Share2,
  Layers,
  Sparkles,
  ArrowRight,
  Plus,
  Check
} from "lucide-react";

const AuthGravityAnimation = () => {
  return (
    <div className="w-full h-full min-h-[700px] relative overflow-hidden bg-gray-50">
      <Gravity
        gravity={{ x: 0, y: 0.12 }}
        className="w-full h-full"
        grabCursor={true}
      >
        {/* Hero Element - Enhanced Brand */}
        <MatterBody
          matterBodyOptions={{ friction: 0.06, restitution: 0.4, density: 0.0004 }}
          x="20%"
          y="18%"
          angle={0}
        >
          <div className="group bg-gray-900 rounded-xl px-3 py-3 hover:cursor-grab">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
                <span className="text-gray-900 font-bold text-xs">PB</span>
              </div>
              <span className="text-white font-bold text-2xl font-sans tracking-tight">
                ProductBazar
              </span>
            </div>
          </div>
        </MatterBody>

        {/* Clean Action Labels */}
        <MatterBody
          matterBodyOptions={{ friction: 0.03, restitution: 0.25, density: 0.00015 }}
          x="35%"
          y="15%"
          angle={-1}
        >
          <div className="text-sm font-medium text-violet-700 bg-violet-50 rounded-full px-5 py-2 border border-violet-200 hover:cursor-grab transition-all duration-300 hover:border-violet-300">
            Discover
          </div>
        </MatterBody>

        <MatterBody
          matterBodyOptions={{ friction: 0.03, restitution: 0.25, density: 0.00015 }}
          x="65%"
          y="20%"
          angle={2}
        >
          <div className="text-sm font-medium text-blue-700 bg-blue-50 rounded-full px-5 py-2 border border-blue-200 hover:cursor-grab transition-all duration-300 hover:border-blue-300">
            Create
          </div>
        </MatterBody>

        <MatterBody
          matterBodyOptions={{ friction: 0.03, restitution: 0.25, density: 0.00015 }}
          x="25%"
          y="80%"
          angle={-2}
        >
          <div className="text-sm font-medium text-purple-700 bg-purple-50 rounded-full px-5 py-2 border border-purple-200 hover:cursor-grab transition-all duration-300 hover:border-purple-300">
            Connect
          </div>
        </MatterBody>

        <MatterBody
          matterBodyOptions={{ friction: 0.03, restitution: 0.25, density: 0.00015 }}
          x="50%"
          y="10%"
          angle={-3}
        >
          <div className="text-sm font-medium text-emerald-700 bg-emerald-50 rounded-full px-5 py-2 border border-emerald-200 hover:cursor-grab transition-all duration-300 hover:border-emerald-300">
            Showcase
          </div>
        </MatterBody>

        <MatterBody
          matterBodyOptions={{ friction: 0.03, restitution: 0.25, density: 0.00015 }}
          x="90%"
          y="35%"
          angle={-2}
        >
          <div className="text-sm font-medium text-orange-700 bg-orange-50 rounded-full px-5 py-2 border border-orange-200 hover:cursor-grab transition-all duration-300 hover:border-orange-300">
            Innovate
          </div>
        </MatterBody>

        <MatterBody
          matterBodyOptions={{ friction: 0.03, restitution: 0.25, density: 0.00015 }}
          x="45%"
          y="95%"
          angle={1}
        >
          <div className="text-sm font-medium text-teal-700 bg-teal-50 rounded-full px-5 py-2 border border-teal-200 hover:cursor-grab transition-all duration-300 hover:border-teal-300">
            Grow
          </div>
        </MatterBody>

        {/* Clean Interactive Elements */}
        <MatterBody
          matterBodyOptions={{ friction: 0.04, restitution: 0.3, density: 0.0002 }}
          x="50%"
          y="45%"
          angle={0}
        >
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 hover:cursor-grab transition-all duration-300 hover:border-pink-200">
            <Heart className="w-4 h-4 text-pink-500" />
            <span className="text-sm text-gray-600">47</span>
          </div>
        </MatterBody>

        <MatterBody
          matterBodyOptions={{ friction: 0.04, restitution: 0.3, density: 0.0002 }}
          x="70%"
          y="60%"
          angle={3}
        >
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 hover:cursor-grab transition-all duration-300 hover:border-emerald-200">
            <Share2 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-gray-600">8</span>
          </div>
        </MatterBody>

        <MatterBody
          matterBodyOptions={{ friction: 0.04, restitution: 0.3, density: 0.0002 }}
          x="55%"
          y="30%"
          angle={-6}
        >
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 hover:cursor-grab transition-all duration-300 hover:border-yellow-200">
            <Bookmark className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600">23</span>
          </div>
        </MatterBody>

        <MatterBody
          matterBodyOptions={{ friction: 0.04, restitution: 0.3, density: 0.0002 }}
          x="25%"
          y="45%"
          angle={5}
        >
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 hover:cursor-grab transition-all duration-300 hover:border-indigo-200">
            <Eye className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-gray-600">156</span>
          </div>
        </MatterBody>

        {/* Clean Status Indicators */}
        <MatterBody
          matterBodyOptions={{ friction: 0.025, restitution: 0.4, density: 0.00012 }}
          x="85%"
          y="15%"
          angle={5}
        >
          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2 border border-green-200 hover:cursor-grab transition-all duration-300 hover:border-green-300">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-green-700">Live</span>
          </div>
        </MatterBody>

        <MatterBody
          matterBodyOptions={{ friction: 0.025, restitution: 0.4, density: 0.00012 }}
          x="15%"
          y="15%"
          angle={-5}
        >
          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2 border border-yellow-200 hover:cursor-grab transition-all duration-300 hover:border-yellow-300">
            <Sparkles className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-medium text-yellow-700">New</span>
          </div>
        </MatterBody>

        <MatterBody
          matterBodyOptions={{ friction: 0.025, restitution: 0.4, density: 0.00012 }}
          x="10%"
          y="65%"
          angle={-4}
        >
          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2 border border-purple-200 hover:cursor-grab transition-all duration-300 hover:border-purple-300">
            <Check className="w-3 h-3 text-purple-500" />
            <span className="text-xs font-medium text-purple-700">Verified</span>
          </div>
        </MatterBody>

        {/* Clean Navigation Element */}
        <MatterBody
          matterBodyOptions={{ friction: 0.04, restitution: 0.2, density: 0.0002 }}
          x="50%"
          y="90%"
          angle={0}
        >
          <div className="flex items-center gap-3 bg-white rounded-full px-6 py-3 border border-gray-200 hover:cursor-grab transition-all duration-300 hover:border-violet-200">
            <Globe className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium text-gray-700">Explore Platform</span>
            <ArrowRight className="w-3 h-3 text-violet-400" />
          </div>
        </MatterBody>

        <MatterBody
          matterBodyOptions={{ friction: 0.04, restitution: 0.2, density: 0.0002 }}
          x="80%"
          y="90%"
          angle={-3}
        >
          <div className="flex items-center gap-3 bg-white rounded-full px-6 py-3 border border-gray-200 hover:cursor-grab transition-all duration-300 hover:border-blue-200">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Get Started</span>
            <ChevronRight className="w-3 h-3 text-blue-400" />
          </div>
        </MatterBody>

        <MatterBody
          matterBodyOptions={{ friction: 0.04, restitution: 0.2, density: 0.0002 }}
          x="20%"
          y="90%"
          angle={4}
        >
          <div className="flex items-center gap-3 bg-white rounded-full px-6 py-3 border border-gray-200 hover:cursor-grab transition-all duration-300 hover:border-emerald-200">
            <Users className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-gray-700">Join Community</span>
            <ArrowRight className="w-3 h-3 text-emerald-400" />
          </div>
        </MatterBody>

        {/* Clean Action Elements */}
        <MatterBody
          matterBodyOptions={{ friction: 0.03, restitution: 0.5, density: 0.00015 }}
          x="60%"
          y="25%"
          angle={-10}
        >
          <div className="flex items-center gap-2 bg-violet-600 rounded-full px-4 py-2 hover:cursor-grab transition-all duration-300 hover:bg-violet-700">
            <Rocket className="w-3 h-3 text-white" />
            <span className="text-xs font-medium text-white">Launch</span>
          </div>
        </MatterBody>

        <MatterBody
          matterBodyOptions={{ friction: 0.03, restitution: 0.5, density: 0.00015 }}
          x="40%"
          y="25%"
          angle={8}
        >
          <div className="flex items-center gap-2 bg-indigo-600 rounded-full px-4 py-2 hover:cursor-grab transition-all duration-300 hover:bg-indigo-700">
            <Trophy className="w-3 h-3 text-white" />
            <span className="text-xs font-medium text-white">Success</span>
          </div>
        </MatterBody>

        <MatterBody
          matterBodyOptions={{ friction: 0.03, restitution: 0.5, density: 0.00015 }}
          x="70%"
          y="35%"
          angle={6}
        >
          <div className="flex items-center gap-2 bg-pink-600 rounded-full px-4 py-2 hover:cursor-grab transition-all duration-300 hover:bg-pink-700">
            <Star className="w-3 h-3 text-white" />
            <span className="text-xs font-medium text-white">Featured</span>
          </div>
        </MatterBody>

        <MatterBody
          matterBodyOptions={{ friction: 0.03, restitution: 0.5, density: 0.00015 }}
          x="15%"
          y="80%"
          angle={-7}
        >
          <div className="flex items-center gap-2 bg-orange-600 rounded-full px-4 py-2 hover:cursor-grab transition-all duration-300 hover:bg-orange-700">
            <TrendingUp className="w-3 h-3 text-white" />
            <span className="text-xs font-medium text-white">Trending</span>
          </div>
        </MatterBody>
      </Gravity>
    </div>
  );
};

export default AuthGravityAnimation;